export enum QuestionType {
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TEXT_INPUT = 'TEXT_INPUT',
  NUMBER_INPUT = 'NUMBER_INPUT',
  SLIDER = 'SLIDER',
  COMPARISON_SLIDER = 'COMPARISON_SLIDER'
}

export interface Survey {
  id: number
  title: string
  description?: string
  createdAt: Date
  isActive: boolean
  questions?: Question[]
}

export interface Question {
  id: number
  surveyId: number
  questionText: string
  questionType: QuestionType
  questionOrder: number
  minValue?: number
  maxValue?: number
  stepValue?: number
  options?: Option[]
}

export interface Option {
  id: number
  questionId: number
  optionText: string
  optionOrder: number
}

export interface Respondent {
  id: number
  name: string
  email: string
  gender?: string
  age?: number
  createdAt: Date
}

export interface Response {
  id: number
  surveyId: number
  respondentId: number
  questionId: number
  answerText?: string
  optionId?: number
  attemptNumber: number
  createdAt: Date
}

export interface CreateSurveyData {
  title: string
  description?: string
  questions: CreateQuestionData[]
}

export interface CreateQuestionData {
  questionText: string
  questionType: QuestionType
  questionOrder: number
  minValue?: number
  maxValue?: number
  stepValue?: number
  options?: CreateOptionData[]
}

export interface CreateOptionData {
  optionText: string
  optionOrder: number
}

export interface RespondentData {
  name: string
  email: string
  gender?: string
  age?: number
}

export interface ResponseData {
  questionId: number
  answerText?: string
  optionId?: number
}

export interface SurveyStatistics {
  totalResponses: number
  responsesByQuestion: {
    [questionId: number]: {
      questionText: string
      questionType: QuestionType
      textResponses?: string[]
      numericResponses?: number[]
      optionResponses?: {
        optionId: number
        optionText: string
        count: number
      }[]
    }
  }
}

 