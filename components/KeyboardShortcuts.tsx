'use client'

import { useState } from 'react'
import { Keyboard, X } from 'lucide-react'

interface KeyboardShortcutsProps {
  onShortcut?: (action: string) => void
}

const shortcuts = [
  { key: 'مسافة / K', action: 'تشغيل/إيقاف', icon: '⏯️' },
  { key: '→', action: 'تقديم 10 ثواني', icon: '⏩' },
  { key: '←', action: 'ترجيع 10 ثواني', icon: '⏪' },
  { key: 'J', action: 'ترجيع 10 ثواني', icon: '⏪' },
  { key: 'L', action: 'تقديم 10 ثواني', icon: '⏩' },
  { key: '↑', action: 'رفع الصوت', icon: '🔊' },
  { key: '↓', action: 'خفض الصوت', icon: '🔉' },
  { key: 'M', action: 'كتم/إلغاء كتم', icon: '🔇' },
  { key: 'F', action: 'ملء الشاشة', icon: '⛶' },
  { key: 'P', action: 'صورة في صورة', icon: '🖼️' },
  { key: 'B', action: 'إضافة علامة', icon: '🔖' },
  { key: '< / >', action: 'تغيير السرعة', icon: '⚡' },
  { key: '0-9', action: 'الانتقال لنسبة %', icon: '📍' },
]

export default function KeyboardShortcuts({ onShortcut }: KeyboardShortcutsProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
        title="اختصارات لوحة المفاتيح"
      >
        <Keyboard className="w-4 h-4" />
        <span className="hidden md:inline">اختصارات</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <Keyboard className="w-6 h-6" />
                <h3 className="font-bold text-lg">اختصارات لوحة المفاتيح</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Shortcuts List */}
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{shortcut.icon}</span>
                      <span className="text-gray-700">{shortcut.action}</span>
                    </div>
                    <kbd className="px-3 py-1.5 bg-gray-200 rounded-lg text-sm font-mono text-gray-800 shadow-sm">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t text-center">
              <p className="text-sm text-gray-500">
                اضغط <kbd className="px-2 py-0.5 bg-gray-200 rounded text-xs">?</kbd> لعرض هذه القائمة
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
