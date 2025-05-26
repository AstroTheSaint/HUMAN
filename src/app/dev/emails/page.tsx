'use client'

import { useState } from 'react'
import { getWelcomeEmailHtml } from '@/lib/email-templates'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function EmailPreviewPage() {
  const [name, setName] = useState('Johnny')
  const emailHtml = getWelcomeEmailHtml(name)

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-screen-xl mx-auto space-y-8">
        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm space-y-4">
          <h1 className="text-2xl font-bold">Email Template Preview</h1>
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Input
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <Button onClick={() => setName('Johnny')}>
              Reset
            </Button>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-xl font-semibold">Welcome Email</h2>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  const w = window.open()
                  if (w) {
                    w.document.write(emailHtml)
                    w.document.close()
                  }
                }}
              >
                Open in New Tab
              </Button>
            </div>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <iframe
              srcDoc={emailHtml}
              className="w-full h-[800px]"
              title="Email Preview"
            />
          </div>
        </div>
      </div>
    </div>
  )
} 