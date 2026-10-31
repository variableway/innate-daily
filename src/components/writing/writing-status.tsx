import {
  Alert,
  AlertDescription,
  AlertTitle,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Skeleton,
} from "@innate/ui"
import { SoftFileText } from "../icons/soft-icons"

export function WritingLoadingState() {
  return (
    <div className="flex h-full min-h-0">
      <Skeleton className="hidden h-full w-56 rounded-none md:block" />
      <Skeleton className="h-full w-full rounded-none md:w-80" />
      <Skeleton className="hidden h-full flex-1 rounded-none md:block" />
    </div>
  )
}

export function WritingErrorState({ message }: { message: string }) {
  return (
    <Alert variant="destructive" className="m-6">
      <AlertTitle>Could not load writing</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

export function WritingEmptyState({ message }: { message: string }) {
  return (
    <Empty className="h-full border-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SoftFileText />
        </EmptyMedia>
        <EmptyTitle>No notes</EmptyTitle>
        <EmptyDescription>{message}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
