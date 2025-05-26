export function getWelcomeEmailHtml(name: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to HUM人N</title>
      </head>
      <body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; color: #333; background-color: #000;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px; background: linear-gradient(to bottom, rgba(0,0,0,0.95), rgba(0,0,0,0.98)); color: #fff;">
          <img 
            src="https://xn--humn-7z5f.com/HUMAN_LOGOTYPE_WHT.png" 
            alt="HUM人N" 
            style="width: 200px; margin: 0 auto 30px; display: block;"
          >
          
          <h1 style="font-size: 24px; margin-bottom: 20px; text-align: center; color: #fff;">Welcome, ${name}!</h1>
          
          <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <p style="margin-bottom: 16px; color: rgba(255,255,255,0.9);">I'm thrilled to have you join us on this incredible journey. As AI reshapes our world, we're here to help you rediscover what makes you uniquely, beautifully human.</p>
            
            <p style="margin-bottom: 16px; color: rgba(255,255,255,0.9);">In the coming days, I'll personally review your registration and activate your account. You'll receive another message from me when everything is ready.</p>
            
            <p style="margin-bottom: 16px; color: rgba(255,255,255,0.9);">In the meantime, feel free to:</p>
            
            <ul style="margin-bottom: 24px; color: rgba(255,255,255,0.9); padding-left: 20px;">
              <li style="margin-bottom: 12px;">Explore our vision for human flourishing in the age of AI</li>
              <li style="margin-bottom: 12px;">Reflect on what makes you uniquely human</li>
              <li style="margin-bottom: 12px;">Think about the divine purpose you'd like to discover</li>
            </ul>
            
            <p style="margin-bottom: 24px; color: rgba(255,255,255,0.9);">I'm looking forward to walking this path with you.</p>
            
            <div style="margin-top: 24px;">
              <p style="margin-bottom: 8px; color: rgba(255,255,255,0.9);">With excitement,</p>
              <p style="font-weight: bold; color: #fff; margin-bottom: 4px;">Johnny</p>
              <a href="https://wa.me/14242224539" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px; display: block;">
                +1 (424) 222-4539
              </a>
            </div>
          </div>

          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
            <a href="https://xn--humn-7z5f.com" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px;">
              HUM人N - A Movement for the Age of AI
            </a>
          </div>
        </div>
      </body>
    </html>
  `
} 