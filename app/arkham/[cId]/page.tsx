export default async function Page({ params }: { params: Promise<{ cId: string }> }) {
  const paramsResolved = await params;
  return <div>Campaign ID: {paramsResolved.cId}</div>;
  
}