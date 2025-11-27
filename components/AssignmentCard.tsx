'use client'

import { useRouter } from 'next/navigation'
import { FileText, Calendar, Award, Clock, CheckCircle, AlertCircle } from 'lucide-react'

interface AssignmentCardProps {
  assignment: any
  submission?: any
}

export default function AssignmentCard({ assignment, submission }: AssignmentCardProps) {
  const router = useRouter()

  const isOverdue = new Date() > new Date(assignment.dueDate)
  const daysUntilDue = Math.ceil(
    (new Date(assignment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )

  const getStatusBadge = () => {
    if (submission) {
      if (submission.status === 'graded') {
        return (
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-semibold flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            تم التقييم
          </span>
        )
      } else if (submission.status === 'resubmitted') {
        return (
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-semibold">
            إعادة تسليم
          </span>
        )
      } else {
        return (
          <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-semibold">
            قيد المراجعة
          </span>
        )
      }
    } else if (isOverdue) {
      return (
        <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm font-semibold flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          متأخر
        </span>
      )
    } else if (daysUntilDue <= 3) {
      return (
        <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-sm font-semibold flex items-center gap-1">
          <Clock className="w-4 h-4" />
          عاجل
        </span>
      )
    }
    return null
  }

  return (
    <div
      onClick={() => router.push(`/assignments/${assignment._id}`)}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-primary-500"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
            <FileText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">
              {assignment.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {assignment.description}
            </p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>
            {isOverdue ? 'انتهى في' : 'ينتهي في'}{' '}
            {new Date(assignment.dueDate).toLocaleDateString('ar-EG')}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Award className="w-4 h-4" />
          <span>الدرجة: {assignment.maxScore}</span>
        </div>
      </div>

      {submission?.status === 'graded' && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-green-800 dark:text-green-400">
              درجتك:
            </span>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
              {submission.score}/{assignment.maxScore}
            </span>
          </div>
        </div>
      )}

      {!submission && !isOverdue && (
        <div className="mt-4">
          <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold">
            ابدأ التسليم
          </button>
        </div>
      )}
    </div>
  )
}
