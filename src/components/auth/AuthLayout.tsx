import React from 'react'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
  features: Array<{
    title: string
    description: string
  }>
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  features,
}) => {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 p-12 text-white">
        <div className="flex flex-col justify-center max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <img 
              src="/BrainFeed No bg Logo(only symbol).png" 
              alt="BrainFeed" 
              className="w-8 h-8"
            />
            <span className="text-2xl font-bold">BrainFeed</span>
          </div>
          
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            {title}
          </h1>
          
          <p className="text-primary-100 mb-12 text-lg leading-relaxed">
            {subtitle}
          </p>
          
          <div className="space-y-8">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col">
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-primary-100 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-neutral-50 dark:bg-neutral-900">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}