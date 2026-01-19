import { Suspense } from 'react';
import GenerateContent from './GenerateContent';
import Loading from './loading';

export default function GeneratePage() {
  return (
    <Suspense fallback={<Loading />}>
      <GenerateContent />
    </Suspense>
  );
}