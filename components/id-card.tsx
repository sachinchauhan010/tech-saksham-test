import { QRCodeCanvas } from 'qrcode.react';

interface User {
  _id?: string;
  userId: string;
  name: string;
  department: string;
}

interface IDCardProps {
  user: User;
}

export const IDCard = ({ user }: IDCardProps) => {
  return (
    <div className="w-full max-w-sm mx-auto" ref={(el) => { (el as any)?.classList?.add('id-card'); }}>
      <div
        className="bg-white rounded-lg shadow-lg overflow-hidden"
        style={{
          width: '335px',
          height: '210px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div className="bg-blue-600 text-white px-4 py-3">
          <h2 className="text-lg font-bold">Saksham Id card</h2>
          <p className="text-xs opacity-90">Government Registry</p>
        </div>

        {/* Content */}
        <div className="flex-1 px-4 py-3 flex items-center justify-between gap-4">
          {/* Left: User Info */}
          <div className="flex-1 space-y-2">
            <div>
              <p className="text-xs text-gray-500 font-semibold">NAME</p>
              <p className="font-bold text-sm truncate">{user.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold">DEPARTMENT</p>
              <p className="text-sm text-gray-700 truncate">{user.department}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold">ID NUMBER</p>
              <p className="font-mono text-sm font-bold text-blue-600">
                {user.userId}
              </p>
            </div>
          </div>

          {/* Right: QR Code */}
          <div className="flex-shrink-0">
            <div className="bg-gray-50 p-2 rounded border border-gray-200">
              <QRCodeCanvas
                value={`${typeof window !== 'undefined' ? window.location.origin : 'https://example.com'}/q&a`}
                size={80}
                level="L"
                includeMargin={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
