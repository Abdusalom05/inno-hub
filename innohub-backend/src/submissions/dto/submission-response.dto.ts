import { ApiProperty } from '@nestjs/swagger';

export class SubmissionCountryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  code: string | null;
}

export class SubmissionJournalDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  slug: string | null;

  @ApiProperty({ nullable: true })
  issn: string | null;
}

export class SubmissionIssueDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  journalId: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ nullable: true })
  volume: string | null;

  @ApiProperty({ nullable: true })
  number: string | null;

  @ApiProperty({ nullable: true })
  year: number | null;

  @ApiProperty({ nullable: true })
  publishedAt: Date | null;
}

export class SubmissionAuthorDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  affiliation: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  submissionId: string;
}

export class SubmissionSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  abstract: string;

  @ApiProperty({ type: [String] })
  keywords: string[];

  @ApiProperty()
  references: string;

  @ApiProperty()
  correspondingEmail: string;

  @ApiProperty()
  countryId: string;

  @ApiProperty()
  journalId: string;

  @ApiProperty()
  issueId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: SubmissionCountryDto })
  country: SubmissionCountryDto;

  @ApiProperty({ type: SubmissionJournalDto })
  journal: SubmissionJournalDto;

  @ApiProperty({ type: SubmissionIssueDto })
  issue: SubmissionIssueDto;

  @ApiProperty({ type: [SubmissionAuthorDto] })
  authors: SubmissionAuthorDto[];
}

export class SubmissionDetailDto extends SubmissionSummaryDto {}

export class PaginatedSubmissionsMetaDto {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  totalPages: number;
}

export class PaginatedSubmissionsResponseDto {
  @ApiProperty({ type: [SubmissionSummaryDto] })
  items: SubmissionSummaryDto[];

  @ApiProperty({ type: PaginatedSubmissionsMetaDto })
  meta: PaginatedSubmissionsMetaDto;
}
