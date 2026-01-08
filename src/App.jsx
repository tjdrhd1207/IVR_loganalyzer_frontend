import { useState } from 'react';
import './App.css'
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function App({ data }) {
  const [channel, setChannel] = useState('');
  const [logText, setLogText] = useState('');
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null); // 분석 결과 저장
  const [loading, setLoading] = useState(false);  

  const handleAnalyze = async(e) => {
    e.preventDefault();
    setLoading(true);

    let base64string = "";
    if (image) {
      const reader = new FileReader();
      base64string = await new Promise((res) => {
        reader.onload = () => resolveConfig(reader.result);
        reader.readAsDataURL(image);
      });
    }

    const payload = {
      mailContent: "사용자 입력 메일 내용 또는 기본값",
      logText: logText,
      logImageBase64: base64string // 'data:image/png;base64,...' 형태
    };

    // 이미지와 텍스트를 함께 보낼 때는 FormData를 사용합니다.
    /* const formData = new FormData();
    formData.append('channel', channel);
    formData.append('logText', logText); */
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload,
      });
      const data = await response.json();
      setResult(data);  
    } catch (error) {
      alert("분석 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10">
      {/* 입력 세션 */}
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow-md mb-8">
        <h1 className="text-xl font-bold mb-6 text-gray-800">IVR 로그 분석 요청</h1>
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">채널 번호</label>
            <input 
              type="text" 
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              placeholder="예: CH-082"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">로그 텍스트</label>
            <textarea 
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 h-32"
              value={logText}
              onChange={(e) => setLogText(e.target.value)}
              placeholder="분석할 로그 내용을 붙여넣으세요..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">스크린샷 업로드 (선택)</label>
            <input 
              type="file" 
              accept="image/*"
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? "AI 분석 중..." : "분석 시작하기"}
          </button>
        </form>
      </div>

      {/* 결과 섹션 */}
      {result && (
        <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl border border-gray-100 p-8">
          {/* ...기존에 만드신 리포트 UI (data 대신 result 사용)... */}
          <div className="border-b-2 border-blue-500 pb-4 mb-6 flex justify-between items-end">
            <h2 className="text-3xl font-extrabold text-gray-900">IVR 분석 리포트</h2>
            <div className="text-2xl font-mono font-bold text-blue-800">{result.channelNumber}</div>
          </div>
          <div className="prose prose-slate max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {result.analysis}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

export default App
