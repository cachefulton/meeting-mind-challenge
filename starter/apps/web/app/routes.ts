import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('meetings/new', 'routes/meetings.new.tsx'),
  route('meetings/:id', 'routes/meetings.$id.tsx'),
  route('meetings', 'routes/meetings._index.tsx'),
] satisfies RouteConfig;
