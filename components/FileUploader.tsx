'use client'

import { useState, useRef } from 'react'
import { Upload, X, CheckCircle, AlertCircle, Loader } from 'lucide-react'

interface FileUploaderProps {
  type: 'video' | 'pdf' | 'presentation'
  onUploadComplete: (url: string, filename: string, size: number) => void
  maxSize?: number // in MB
}

export default function FileUploader({ type, onUploadComplete, maxSize }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getAcceptedTypes = () => {
    switch (type) {
      case 'video':
        return 'video/mp4,video/webm,video/ogg,video/quicktime'
      case 'pdf':
        return 'application/pdf'
      case 'presentation':
        return '.ppt,.pptx,.odp'
      default:
        return '*'
    }
  }

  const getMaxSize = () => {
    if (maxSize) return maxSize
    switch (type) {
      case 'video':
        return 500 // 500MB
      case 'pdf':
        return 50 // 50MB
      case 'presentation':
        return 100 // 100MB
      default:
        return 10
    }
  }

  const getTypeLabel = () => {
    switch (type) {
      case 'video':
        return 'فيديو'
      case 'pdf':
        return 'PDF'
      case 'presentation':
        return 'عرض تقديمي'
      default:
        return 'ملف'
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate size
    const maxSizeBytes = getMaxSize() * 1024 * 1024
    if (selectedFile.size > maxSizeBytes) {
      setError(`حجم الملف كبير جداً. الحد الأقصى ${getMaxSize()}MB`)
      return
    }

    setFile(selectedFile)
    setError('')
    setSuccess(false)
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setProgress(0)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Simulate progress (since we can't track real upload progress easily)
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch(`/api/upload/${type}`, {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        onUploadComplete(data.data.url, data.data.filename, data.data.size)
        
        // Reset after 2 seconds
        setTimeout(() => {
          setFile(null)
          setSuccess(false)
          setProgress(0)
        }, 2000)
      } else {
        setError(data.message || 'حدث خطأ أثناء الرفع')
      }
    } catch (err: any) {
      setError('حدث خطأ أثناء الرفع')
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setFile(null)
    setError('')
    setSuccess(false)
    setProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {!file && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept={getAcceptedTypes()}
            onChange={handleFileSelect}
            className="hidden"
            id={`file-upload-${type}`}
          />
          <label
            htmlFor={`file-upload-${type}`}
            className="cursor-pointer flex flex-col items-center gap-3"
          >
            <Upload className="w-12 h-12 text-gray-400" />
            <div>
              <p className="text-lg font-semibold text-gray-700">
                اضغط لرفع {getTypeLabel()}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                الحد الأقصى: {getMaxSize()}MB
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Selected File */}
      {file && !success && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
            </div>
            {!uploading && (
              <button
                onClick={handleRemove}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="mb-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-1 text-center">
                {progress}% - جاري الرفع...
              </p>
            </div>
          )}

          {/* Upload Button */}
          {!uploading && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              رفع الملف
            </button>
          )}

          {/* Uploading State */}
          {uploading && (
            <div className="flex items-center justify-center gap-2 text-primary-600">
              <Loader className="w-5 h-5 animate-spin" />
              <span>جاري الرفع...</span>
            </div>
          )}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <p className="font-semibold text-green-900">تم الرفع بنجاح!</p>
            <p className="text-sm text-green-700">تم حفظ الملف</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <div>
            <p className="font-semibold text-red-900">خطأ</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}
