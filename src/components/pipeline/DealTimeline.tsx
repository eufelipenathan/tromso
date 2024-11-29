import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageSquare, Clock } from 'lucide-react';

interface TimelineEvent {
  id: string;
  type: 'task' | 'interaction' | 'email';
  title: string;
  user: {
    name: string;
    avatar: string;
  };
  date: Date;
  status: 'open' | 'completed';
}

interface DealTimelineProps {
  events: TimelineEvent[];
}

const DealTimeline: React.FC<DealTimelineProps> = ({ events }) => {
  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {events.map((event, eventIdx) => (
          <li key={event.id}>
            <div className="relative pb-8">
              {eventIdx !== events.length - 1 ? (
                <span
                  className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex items-start space-x-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                    <span className="text-sm font-medium text-white">
                      {event.user.avatar}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {event.user.name}
                        </span>
                        {event.type === 'task' && (
                          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                            ALTA
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {format(event.date, "EEEE',' dd 'de' MMMM 'às' HH:mm", {
                          locale: ptBR
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900">
                      {event.title}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <button className="flex items-center space-x-1 hover:text-gray-900">
                          <MessageSquare className="h-4 w-4" />
                          <span>Comentar</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:text-gray-900">
                          <Clock className="h-4 w-4" />
                          <span>Histórico</span>
                        </button>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500">Unix Pack</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DealTimeline;