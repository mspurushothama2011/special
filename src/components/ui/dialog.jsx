import * as React from "react"
import { X } from "lucide-react"

const Dialog = ({ open, onOpenChange, children }) => {
    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => onOpenChange(false)}>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
            <div className="relative w-full max-w-lg z-50">
                {children}
            </div>
        </div>
    )
}

const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => (
    <div
        ref={ref}
        className={`relative bg-white rounded-3xl shadow-2xl p-6 ${className || ''}`}
        onClick={(e) => e.stopPropagation()}
        {...props}
    >
        {children}
    </div>
))
DialogContent.displayName = "DialogContent"

const DialogHeader = ({ className, ...props }) => (
    <div
        className={`flex flex-col space-y-1.5 ${className || ''}`}
        {...props}
    />
)
DialogHeader.displayName = "DialogHeader"

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
    <h2
        ref={ref}
        className={`text-lg font-semibold leading-none tracking-tight ${className || ''}`}
        {...props}
    />
))
DialogTitle.displayName = "DialogTitle"

export {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
}
