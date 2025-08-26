import { users } from '../../../../lib/userStore';

export async function PUT(req, { params }) {
  const id = Number(params.id);
  const body = await req.json();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) {
    return new Response(null, { status: 404 });
  }
  users[index] = { ...users[index], ...body };
  return Response.json(users[index]);
}

export async function DELETE(req, { params }) {
  const id = Number(params.id);
  const index = users.findIndex(u => u.id === id);
  if (index === -1) {
    return new Response(null, { status: 404 });
  }
  users.splice(index, 1);
  return new Response(null, { status: 204 });
}
