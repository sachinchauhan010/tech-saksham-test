'use client';

import { use } from 'react';
import RegistrationForm from '@/components/RegistrationForm';
import ComponentWrapper from '@/components/ComponentWrapper';

export default function RegisterPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  return (
    <ComponentWrapper>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
        <RegistrationForm eventId={resolvedParams.id} />
      </div>
    </ComponentWrapper>
  );
}
