import Link from "next/link";

export default function Page() {
  return (
    <main>
      <div className="hero">
        <h1>SoriSori</h1>
        <p>로컬 STT faster-whisper + LM Studio 번역으로 실시간 한국어 자막 MVP.</p>
        <div className="row">
          <Link href="/session" className="badge code">
            /session 라이브 뷰로 이동
          </Link>
        </div>
      </div>
    </main>
  );
}
