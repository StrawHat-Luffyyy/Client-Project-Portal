'use client';

import {
  createCommentSchema,
  type AuthUser,
  type Comment,
  type CommentVisibility,
  type CreateCommentInput,
} from '@client-portal/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { apiRequest } from '../../lib/api-client';
import {
  commentResponseSchema,
  commentsResponseSchema,
} from '../../lib/workspace-api';
import {
  FormAlert,
  FormField,
  SelectInput,
  SubmitButton,
  TextAreaInput,
} from '../auth/form-controls';

type CommentTargetType = 'requirements' | 'tasks';

const visibilityStyles: Record<CommentVisibility, string> = {
  INTERNAL: 'bg-violet-100 text-violet-800',
  CLIENT_VISIBLE: 'bg-emerald-100 text-emerald-800',
};

function visibilityLabel(visibility: CommentVisibility) {
  return visibility === 'INTERNAL' ? 'Internal' : 'Client visible';
}

function CommentItem({
  comment,
  replies,
  onReply,
}: {
  comment: Comment;
  replies: Comment[];
  onReply: (comment: Comment) => void;
}) {
  return (
    <li>
      <article className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-slate-900">
            {comment.author.name}
          </p>
          <span
            className={`rounded-full px-2 py-0.5 text-[0.7rem] font-semibold ${visibilityStyles[comment.visibility]}`}
          >
            {visibilityLabel(comment.visibility)}
          </span>
        </div>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
          {comment.body}
        </p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <time className="text-xs text-slate-500" dateTime={comment.createdAt}>
            {new Date(comment.createdAt).toLocaleString()}
          </time>
          <button
            className="min-h-9 rounded-md px-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
            onClick={() => onReply(comment)}
            type="button"
          >
            Reply
          </button>
        </div>
      </article>
      {replies.length > 0 ? (
        <ul className="ml-4 mt-2 grid gap-2 border-l-2 border-slate-200 pl-3 sm:ml-8">
          {replies.map((reply) => (
            <li key={reply.id}>
              <article className="rounded-lg bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">
                    {reply.author.name}
                  </p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[0.7rem] font-semibold ${visibilityStyles[reply.visibility]}`}
                  >
                    {visibilityLabel(reply.visibility)}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {reply.body}
                </p>
                <time
                  className="mt-3 block text-xs text-slate-500"
                  dateTime={reply.createdAt}
                >
                  {new Date(reply.createdAt).toLocaleString()}
                </time>
              </article>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function CommentThread({
  targetType,
  targetId,
  user,
  enabled = true,
  compact = false,
}: {
  targetType: CommentTargetType;
  targetId: string;
  user: AuthUser;
  enabled?: boolean;
  compact?: boolean;
}) {
  const queryClient = useQueryClient();
  const defaultVisibility: CommentVisibility =
    user.role === 'CLIENT' ? 'CLIENT_VISIBLE' : 'INTERNAL';
  const [replyingTo, setReplyingTo] = useState<Comment>();
  const [success, setSuccess] = useState<string>();
  const queryKey = ['comments', targetType, targetId];
  const comments = useQuery({
    queryKey,
    enabled,
    queryFn: async () =>
      commentsResponseSchema.parse(
        await apiRequest<unknown>(
          `/${targetType}/${targetId}/comments?pageSize=100`,
        ),
      ).data,
  });
  const form = useForm<CreateCommentInput>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: {
      body: '',
      visibility: defaultVisibility,
      parentId: null,
    },
  });
  const createComment = useMutation({
    mutationFn: async (input: CreateCommentInput) =>
      commentResponseSchema.parse(
        await apiRequest<unknown>(
          `/${targetType}/${targetId}/comments`,
          { method: 'POST', body: JSON.stringify(input) },
          { csrf: true },
        ),
      ).data,
    onSuccess: async () => {
      setReplyingTo(undefined);
      form.reset({ body: '', visibility: defaultVisibility, parentId: null });
      setSuccess('Comment posted.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey }),
        queryClient.invalidateQueries({ queryKey: ['requirement'] }),
      ]);
    },
  });
  const roots = comments.data?.filter((comment) => !comment.parentId) ?? [];

  function startReply(comment: Comment) {
    setSuccess(undefined);
    setReplyingTo(comment);
    form.setValue('parentId', comment.id);
    form.setValue('visibility', comment.visibility);
  }

  function cancelReply() {
    setReplyingTo(undefined);
    form.setValue('parentId', null);
    form.setValue('visibility', defaultVisibility);
  }

  return (
    <div
      className={
        compact
          ? ''
          : 'rounded-xl border border-slate-200 bg-white p-6 shadow-sm'
      }
    >
      {!compact ? (
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Discussion</h2>
          <p className="mt-1 text-sm text-slate-500">
            Coordinate with the delivery team and client in the right channel.
          </p>
        </div>
      ) : null}

      {comments.isPending ? (
        <p className="mt-4 text-sm text-slate-600" aria-busy="true">
          Loading comments…
        </p>
      ) : comments.isError ? (
        <div className="mt-4">
          <FormAlert message={comments.error.message} />
        </div>
      ) : roots.length === 0 ? (
        <p className="mt-4 rounded-lg bg-slate-50 px-4 py-4 text-sm text-slate-600">
          No comments yet. Start the conversation below.
        </p>
      ) : (
        <ul className="mt-4 grid gap-3">
          {roots.map((comment) => (
            <CommentItem
              comment={comment}
              key={comment.id}
              onReply={startReply}
              replies={
                comments.data?.filter(
                  (candidate) => candidate.parentId === comment.id,
                ) ?? []
              }
            />
          ))}
        </ul>
      )}

      <form
        className="mt-5 space-y-4 border-t border-slate-200 pt-5"
        onSubmit={(event) =>
          void form.handleSubmit((input) => {
            setSuccess(undefined);
            createComment.mutate(input);
          })(event)
        }
      >
        <input type="hidden" {...form.register('parentId')} />
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-950">
            {replyingTo ? `Reply to ${replyingTo.author.name}` : 'Add comment'}
          </h3>
          {replyingTo ? (
            <button
              className="min-h-9 rounded-md px-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              onClick={cancelReply}
              type="button"
            >
              Cancel reply
            </button>
          ) : null}
        </div>
        <FormField error={form.formState.errors.body?.message} label="Message">
          <TextAreaInput
            className={compact ? 'min-h-24' : undefined}
            placeholder="Share a useful update or question."
            {...form.register('body')}
          />
        </FormField>
        {user.role !== 'CLIENT' && !replyingTo ? (
          <FormField
            error={form.formState.errors.visibility?.message}
            helper="Internal comments are never shown to clients."
            label="Visibility"
          >
            <SelectInput {...form.register('visibility')}>
              <option value="INTERNAL">Internal team only</option>
              <option value="CLIENT_VISIBLE">Visible to client</option>
            </SelectInput>
          </FormField>
        ) : (
          <>
            <input type="hidden" {...form.register('visibility')} />
            {replyingTo && user.role !== 'CLIENT' ? (
              <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">
                Reply visibility: {visibilityLabel(replyingTo.visibility)}
              </p>
            ) : null}
          </>
        )}
        <FormAlert message={createComment.error?.message} />
        <FormAlert message={success} success />
        <SubmitButton pending={createComment.isPending}>
          {replyingTo ? 'Post reply' : 'Post comment'}
        </SubmitButton>
      </form>
    </div>
  );
}
