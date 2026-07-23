import type { QuizSummary } from '@quiz/shared'
import { ArrowRight, ListChecks } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

/** One quiz in the catalogue grid — title, blurb, question count and a start link. */
export function QuizCard({ quiz }: { quiz: QuizSummary }) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-1">
        <CardTitle>{quiz.title}</CardTitle>
        <CardDescription>{quiz.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <span className="text-muted-foreground inline-flex items-center gap-1.5 text-sm">
          <ListChecks className="size-4" />
          {quiz.questionCount} {quiz.questionCount === 1 ? 'question' : 'questions'}
        </span>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/quiz/${quiz.id}`}>
            Start quiz
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
