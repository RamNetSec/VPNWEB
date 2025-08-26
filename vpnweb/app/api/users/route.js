import { users } from '../../../lib/userStore';

export async function GET() {
  return Response.json(users);
}

export async function POST(req) {
  const body = await req.json();
  const newUser = { id: Date.now(), ...body };
  users.push(newUser);
  return Response.json(newUser, { status: 201 });
}
