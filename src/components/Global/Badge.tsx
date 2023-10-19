export const TinyGrayBadge = (props: {children: any}) => {
    return (
        <span
            {...props}
            className="inline-flex cursor-default items-center rounded-md bg-gray-50 px-2 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">{props.children}</span>
    )
}

export const TinyGreenBadge = (props: {children: any}) => {
    return (
        <span
            {...props}
            className="inline-flex cursor-default items-center rounded-md bg-green-50 px-2 text-xs font-medium text-green-600 ring-1 ring-inset ring-green-500/10">{props.children}</span>
    )
}