export default function Page({ params }: { params: { cId: string } }) {
  return <div>Campaign ID: {params.cId}</div>;
}