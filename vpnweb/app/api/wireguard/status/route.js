import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    const { stdout } = await execAsync('wg show');
    return new Response(stdout, { status: 200 });
  } catch (err) {
    return new Response(err.stderr || err.message, { status: 500 });
  }
}
