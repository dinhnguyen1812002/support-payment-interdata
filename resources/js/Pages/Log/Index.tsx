import React, { useEffect, useState, useRef } from 'react';

const Logs: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    window.Echo.channel('logs').listen(
      '.App\\Events\\LogUpdated',
      (e: { message: string }) => {
        setLogs(prev => [...prev, e.message]);
      },
    );

    return () => {
      window.Echo.leave('logs');
    };
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Laravel Logs (Realtime)</h1>
      <div className="bg-black text-green-300 p-4 h-[80vh] overflow-auto text-sm font-mono rounded whitespace-pre-wrap">
        {logs.map((line, index) => (
          <div key={index}>{line}</div>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};

export default Logs;
