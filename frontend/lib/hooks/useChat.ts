import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '../api/chat';

export function useChatMessages(room: string, enabled = true) {
  return useQuery({
    queryKey: ['chat', room],
    queryFn: () => chatApi.getMessages(room),
    refetchInterval: enabled ? 4000 : false,
    staleTime: 0,
  });
}

export function useSendChatMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ room, body }: { room: string; body: string }) =>
      chatApi.sendMessage(room, body),
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ['chat', vars.room] }),
  });
}
