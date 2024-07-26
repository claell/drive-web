const driveListItemSkinSkeleton = [
  <div className="mr-3 flex w-full flex-row items-center space-x-3">
    <div className="h-8 w-8 rounded-md bg-gray-5" />
    <div className="h-4 w-full rounded bg-gray-5" />
  </div>,
  <div className="mr-3 h-4 w-64 rounded bg-gray-5" />,
  <div className="mr-3 h-4 w-24 rounded bg-gray-5" />,
  <div className="mr-3 h-4 w-20 rounded bg-gray-5" />,
];

const shareListItemSkinSkeleton = [
  <div key="1" className="mr-3 flex w-full min-w-activity flex-row items-center space-x-3">
    <div key="2" className="h-8 w-8 rounded-md bg-gray-5" />
    <div key="3" className="h-4 w-full rounded bg-gray-5" />
  </div>,
  <div key="4" className="mr-3 h-4 w-full rounded bg-gray-5" />, //ml-4
  <div key="5" className="mr-3 h-4 w-full rounded bg-gray-5" />,
  <div key="6" className="h-4 w-full rounded bg-gray-5" />,
];

export { driveListItemSkinSkeleton, shareListItemSkinSkeleton };
