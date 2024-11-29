import React from 'react';
import { MessageSquare, Phone, Mail, Calendar, Paperclip, Mic } from 'lucide-react';
import Button from '../Button';

interface DealInteractionFormProps {
  onSubmit: (data: any) => Promise<void>;
}

const DealInteractionForm: React.FC<DealInteractionFormProps> = ({ onSubmit }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({});
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-4 py-3 border-b">
        <div className="flex items-center space-x-6">
          <button
            type="button"
            className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Registrar interação</span>
          </button>
          <button
            type="button"
            className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <Calendar className="h-4 w-4" />
            <span>Agendar tarefa</span>
          </button>
          <button
            type="button"
            className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <Mail className="h-4 w-4" />
            <span>Enviar e-mail</span>
          </button>
          <button
            type="button"
            className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <Phone className="h-4 w-4" />
            <span>Novo negócio</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4">
        <div className="relative">
          <textarea
            rows={3}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm resize-none"
            placeholder="Marque um usuário com @ ou digite / para mais opções..."
          />
          <div className="absolute bottom-2 right-2 flex items-center space-x-2">
            <button
              type="button"
              className="p-1.5 text-gray-400 hover:text-gray-600"
            >
              <Mic className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="p-1.5 text-gray-400 hover:text-gray-600"
            >
              <Paperclip className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button type="button" className="p-1.5 text-gray-400 hover:text-gray-600">
              <Phone className="h-5 w-5" />
            </button>
            <button type="button" className="p-1.5 text-gray-400 hover:text-gray-600">
              <Mail className="h-5 w-5" />
            </button>
            <button type="button" className="p-1.5 text-gray-400 hover:text-gray-600">
              <MessageSquare className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <Button type="submit" size="sm">
              Salvar
            </Button>
            <Button type="button" variant="secondary" size="sm">
              Adicionar anexo
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DealInteractionForm;