export function getRelativeTime(date: Date | string) {
  const now = new Date();
  const postDate = new Date(date);
  const diffInMs = now.getTime() - postDate.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return `azi ${postDate.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}`;
  }
  if (diffInDays === 1) {
    return `ieri ${postDate.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}`;
  }
  if (diffInDays < 7) {
    return postDate.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' });
  }
  return postDate.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' });
}