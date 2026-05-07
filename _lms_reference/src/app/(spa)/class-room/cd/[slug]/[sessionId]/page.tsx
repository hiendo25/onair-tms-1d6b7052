import ClassRoomCountDownSection from "./_components";

interface ClassRoomCountDown {
  params: {
    sessionId: string
  }
}

async function ClassRoomCountDownPage({ params }: ClassRoomCountDown) {
  const { sessionId } = await params
  return (
    <ClassRoomCountDownSection sessionId={sessionId} />
  );
}

export default ClassRoomCountDownPage;