import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, SubmissionAuditAction } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { ListSubmissionsQueryDto } from './dto/list-submissions-query.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';

const submissionCountrySelect = {
  id: true,
  name: true,
  code: true,
} satisfies Prisma.CountrySelect;

const submissionJournalSelect = {
  id: true,
  name: true,
  slug: true,
  issn: true,
} satisfies Prisma.JournalSelect;

const submissionIssueSelect = {
  id: true,
  journalId: true,
  title: true,
  volume: true,
  number: true,
  year: true,
  publishedAt: true,
} satisfies Prisma.IssueSelect;

const submissionAuthorSelect = {
  id: true,
  fullName: true,
  affiliation: true,
  email: true,
  submissionId: true,
} satisfies Prisma.AuthorSelect;

const submissionSelect = {
  id: true,
  title: true,
  abstract: true,
  keywords: true,
  references: true,
  correspondingEmail: true,
  createdAt: true,
  updatedAt: true,
  country: {
    select: submissionCountrySelect,
  },
  journal: {
    select: submissionJournalSelect,
  },
  issue: {
    select: submissionIssueSelect,
  },
  authors: {
    orderBy: [{ fullName: 'asc' }, { id: 'asc' }],
    select: submissionAuthorSelect,
  },
} satisfies Prisma.SubmissionSelect;

type SubmissionRecord = Prisma.SubmissionGetPayload<{
  select: typeof submissionSelect;
}>;

type PrismaClientLike = PrismaService | Prisma.TransactionClient;

@Injectable()
export class SubmissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: AuthenticatedUser, dto: CreateSubmissionDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertEditorialRelations(
        tx,
        dto.countryId,
        dto.journalId,
        dto.issueId,
      );

      const authors = dto.authors ? this.normalizeAuthors(dto.authors) : [];

      const submission = await tx.submission.create({
        data: {
          title: this.normalizeRequiredText(dto.title, 'Title'),
          abstract: this.normalizeRequiredText(dto.abstract, 'Abstract'),
          keywords: this.normalizeKeywords(dto.keywords),
          references: this.normalizeRequiredText(dto.references, 'References'),
          correspondingEmail: this.normalizeEmail(dto.correspondingEmail),
          country: {
            connect: {
              id: dto.countryId,
            },
          },
          journal: {
            connect: {
              id: dto.journalId,
            },
          },
          issue: {
            connect: {
              id: dto.issueId,
            },
          },
          ...(authors.length > 0
            ? {
                authors: {
                  create: authors,
                },
              }
            : {}),
        },
        select: submissionSelect,
      });

      await this.createAuditLog(tx, {
        submissionId: submission.id,
        actorId: user.id,
        action: SubmissionAuditAction.CREATED,
        after: this.buildAuditSnapshot(submission),
      });

      return this.mapSubmission(submission);
    });
  }

  async findAll(query: ListSubmissionsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.SubmissionWhereInput = {
      ...(query.countryId ? { countryId: query.countryId } : {}),
      ...(query.journalId ? { journalId: query.journalId } : {}),
      ...(query.issueId ? { issueId: query.issueId } : {}),
      ...(query.search
        ? {
            OR: [
              {
                title: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
              {
                abstract: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
              {
                correspondingEmail: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
              {
                references: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
              {
                country: {
                  name: {
                    contains: query.search,
                    mode: 'insensitive',
                  },
                },
              },
              {
                journal: {
                  name: {
                    contains: query.search,
                    mode: 'insensitive',
                  },
                },
              },
              {
                issue: {
                  title: {
                    contains: query.search,
                    mode: 'insensitive',
                  },
                },
              },
              {
                authors: {
                  some: {
                    OR: [
                      {
                        fullName: {
                          contains: query.search,
                          mode: 'insensitive',
                        },
                      },
                      {
                        affiliation: {
                          contains: query.search,
                          mode: 'insensitive',
                        },
                      },
                      {
                        email: {
                          contains: query.search,
                          mode: 'insensitive',
                        },
                      },
                    ],
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.submission.findMany({
        where,
        select: submissionSelect,
        skip,
        take: limit,
        orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.submission.count({ where }),
    ]);

    return {
      items: items.map((item) => this.mapSubmission(item)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findOne(id: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id },
      select: submissionSelect,
    });

    if (!submission) {
      throw new NotFoundException('Submission not found.');
    }

    return this.mapSubmission(submission);
  }

  async update(user: AuthenticatedUser, id: string, dto: UpdateSubmissionDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await this.findSubmissionOrThrow(tx, id);
      const before = this.buildAuditSnapshot(existing);

      const nextCountryId = dto.countryId ?? existing.country.id;
      const nextJournalId = dto.journalId ?? existing.journal.id;
      const nextIssueId = dto.issueId ?? existing.issue.id;

      if (
        dto.countryId !== undefined ||
        dto.journalId !== undefined ||
        dto.issueId !== undefined
      ) {
        await this.assertEditorialRelations(
          tx,
          nextCountryId,
          nextJournalId,
          nextIssueId,
        );
      }

      const data: Prisma.SubmissionUpdateInput = {};

      if (dto.title !== undefined) {
        data.title = this.normalizeRequiredText(dto.title, 'Title');
      }
      if (dto.abstract !== undefined) {
        data.abstract = this.normalizeRequiredText(dto.abstract, 'Abstract');
      }
      if (dto.keywords !== undefined) {
        data.keywords = this.normalizeKeywords(dto.keywords);
      }
      if (dto.references !== undefined) {
        data.references = this.normalizeRequiredText(
          dto.references,
          'References',
        );
      }
      if (dto.correspondingEmail !== undefined) {
        data.correspondingEmail = this.normalizeEmail(dto.correspondingEmail);
      }
      if (dto.countryId !== undefined) {
        data.country = {
          connect: {
            id: dto.countryId,
          },
        };
      }
      if (dto.journalId !== undefined) {
        data.journal = {
          connect: {
            id: dto.journalId,
          },
        };
      }
      if (dto.issueId !== undefined) {
        data.issue = {
          connect: {
            id: dto.issueId,
          },
        };
      }

      const replacementAuthors =
        dto.authors !== undefined
          ? this.normalizeAuthors(dto.authors)
          : undefined;

      const hasSubmissionFieldChanges = Object.keys(data).length > 0;

      if (hasSubmissionFieldChanges) {
        await tx.submission.update({
          where: { id },
          data,
        });
      }

      if (replacementAuthors !== undefined) {
        await tx.author.deleteMany({
          where: {
            submissionId: id,
          },
        });

        if (replacementAuthors.length > 0) {
          await tx.author.createMany({
            data: replacementAuthors.map((author) => ({
              ...author,
              submissionId: id,
            })),
          });
        }
      }

      const updated =
        hasSubmissionFieldChanges || replacementAuthors !== undefined
          ? await this.findSubmissionOrThrow(tx, id)
          : existing;

      const after = this.buildAuditSnapshot(updated);

      if (this.snapshotsDiffer(before, after)) {
        await this.createAuditLog(tx, {
          submissionId: id,
          actorId: user.id,
          action: SubmissionAuditAction.UPDATED,
          before,
          after,
        });
      }

      return this.mapSubmission(updated);
    });
  }

  async addAuthor(
    user: AuthenticatedUser,
    submissionId: string,
    dto: CreateAuthorDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const submissionBefore = await this.findSubmissionOrThrow(
        tx,
        submissionId,
      );
      const authorData = this.normalizeAuthor(dto);

      const author = await tx.author.create({
        data: {
          ...authorData,
          submission: {
            connect: {
              id: submissionId,
            },
          },
        },
        select: submissionAuthorSelect,
      });

      const submissionAfter = await this.findSubmissionOrThrow(
        tx,
        submissionId,
      );

      await this.createAuditLog(tx, {
        submissionId,
        actorId: user.id,
        action: SubmissionAuditAction.AUTHOR_ADDED,
        before: this.buildAuditSnapshot(submissionBefore),
        after: this.buildAuditSnapshot(submissionAfter),
      });

      return author;
    });
  }

  async removeAuthor(user: AuthenticatedUser, authorId: string) {
    return this.prisma.$transaction(async (tx) => {
      const author = await tx.author.findUnique({
        where: { id: authorId },
        select: {
          id: true,
          submissionId: true,
        },
      });

      if (!author) {
        throw new NotFoundException('Author not found.');
      }

      const submissionBefore = await this.findSubmissionOrThrow(
        tx,
        author.submissionId,
      );

      await tx.author.delete({
        where: {
          id: authorId,
        },
      });

      const submissionAfter = await this.findSubmissionOrThrow(
        tx,
        author.submissionId,
      );

      await this.createAuditLog(tx, {
        submissionId: author.submissionId,
        actorId: user.id,
        action: SubmissionAuditAction.AUTHOR_REMOVED,
        before: this.buildAuditSnapshot(submissionBefore),
        after: this.buildAuditSnapshot(submissionAfter),
      });

      return {
        message: 'Author deleted successfully.',
      };
    });
  }

  private async findSubmissionOrThrow(client: PrismaClientLike, id: string) {
    const submission = await client.submission.findUnique({
      where: { id },
      select: submissionSelect,
    });

    if (!submission) {
      throw new NotFoundException('Submission not found.');
    }

    return submission;
  }

  private async assertEditorialRelations(
    client: PrismaClientLike,
    countryId: string,
    journalId: string,
    issueId: string,
  ) {
    const [country, journal, issue] = await Promise.all([
      client.country.findUnique({
        where: { id: countryId },
        select: {
          id: true,
        },
      }),
      client.journal.findUnique({
        where: { id: journalId },
        select: {
          id: true,
        },
      }),
      client.issue.findUnique({
        where: { id: issueId },
        select: {
          id: true,
          journalId: true,
        },
      }),
    ]);

    if (!country) {
      throw new NotFoundException('Country not found.');
    }

    if (!journal) {
      throw new NotFoundException('Journal not found.');
    }

    if (!issue) {
      throw new NotFoundException('Issue not found.');
    }

    if (issue.journalId !== journalId) {
      throw new BadRequestException(
        'Issue does not belong to the selected journal.',
      );
    }
  }

  private async createAuditLog(
    client: PrismaClientLike,
    params: {
      submissionId: string;
      actorId?: string | null;
      action: SubmissionAuditAction;
      before?: Prisma.InputJsonValue;
      after?: Prisma.InputJsonValue;
    },
  ) {
    await client.submissionAuditLog.create({
      data: {
        submission: {
          connect: {
            id: params.submissionId,
          },
        },
        ...(params.actorId
          ? {
              actor: {
                connect: {
                  id: params.actorId,
                },
              },
            }
          : {}),
        action: params.action,
        before: params.before,
        after: params.after,
      },
    });
  }

  private mapSubmission(submission: SubmissionRecord) {
    return {
      id: submission.id,
      title: submission.title,
      abstract: submission.abstract,
      keywords: submission.keywords,
      references: submission.references,
      correspondingEmail: submission.correspondingEmail,
      countryId: submission.country.id,
      journalId: submission.journal.id,
      issueId: submission.issue.id,
      createdAt: submission.createdAt,
      updatedAt: submission.updatedAt,
      country: submission.country,
      journal: submission.journal,
      issue: submission.issue,
      authors: submission.authors,
    };
  }

  private buildAuditSnapshot(submission: SubmissionRecord): Prisma.JsonObject {
    return {
      id: submission.id,
      title: submission.title,
      abstract: submission.abstract,
      keywords: submission.keywords,
      references: submission.references,
      correspondingEmail: submission.correspondingEmail,
      countryId: submission.country.id,
      journalId: submission.journal.id,
      issueId: submission.issue.id,
      createdAt: submission.createdAt.toISOString(),
      updatedAt: submission.updatedAt.toISOString(),
      country: {
        ...submission.country,
      },
      journal: {
        ...submission.journal,
      },
      issue: {
        ...submission.issue,
        publishedAt: submission.issue.publishedAt?.toISOString() ?? null,
      },
      authors: submission.authors.map((author) => ({
        ...author,
      })),
    };
  }

  private snapshotsDiffer(
    before: Prisma.InputJsonValue | undefined,
    after: Prisma.InputJsonValue | undefined,
  ) {
    return JSON.stringify(before ?? null) !== JSON.stringify(after ?? null);
  }

  private normalizeKeywords(keywords: string[]) {
    const normalized = keywords
      .map((keyword) => this.normalizeOptionalText(keyword))
      .filter((keyword): keyword is string => Boolean(keyword));

    if (normalized.length === 0) {
      throw new BadRequestException('At least one keyword is required.');
    }

    return Array.from(new Set(normalized));
  }

  private normalizeAuthors(authors: CreateAuthorDto[]) {
    return authors.map((author) => this.normalizeAuthor(author));
  }

  private normalizeAuthor(author: CreateAuthorDto) {
    return {
      fullName: this.normalizeRequiredText(author.fullName, 'Author full name'),
      affiliation: this.normalizeRequiredText(
        author.affiliation,
        'Author affiliation',
      ),
      email: this.normalizeEmail(author.email),
    };
  }

  private normalizeEmail(email: string) {
    return this.normalizeRequiredText(email, 'Email').toLowerCase();
  }

  private normalizeRequiredText(value: string, fieldLabel: string) {
    const normalized = value.trim();

    if (!normalized) {
      throw new BadRequestException(`${fieldLabel} cannot be empty.`);
    }

    return normalized;
  }

  private normalizeOptionalText(value: string | null | undefined) {
    if (typeof value !== 'string') {
      return undefined;
    }

    const normalized = value.trim();
    return normalized || undefined;
  }
}
