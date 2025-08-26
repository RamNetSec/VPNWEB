import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { UserQueries, SecurityQueries } from '../../../../lib/database';
import { SecurityUtils } from '../../../../lib/security';
import { headers } from 'next/headers';

const apiLimiter = SecurityUtils.createRateLimiter(15, 15 * 60 * 1000);

async function logSecurityEvent(session, action, details, severity = 'info') {
  try {
    const headersList = headers();
    const ipAddress = headersList.get('x-forwarded-for') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';
    
    SecurityQueries.logSecurityEvent(
      session?.user?.id ? parseInt(session.user.id) : null,
      action,
      ipAddress,
      userAgent,
      details,
      severity
    );
  } catch (error) {
    console.error('Error logging security event:', error);
  }
}

function validateUserId(id) {
  const numericId = parseInt(id);
  if (isNaN(numericId) || numericId <= 0) {
    return null;
  }
  return numericId;
}

export async function PUT(request, { params }) {
  let session;
  try {
    session = await getServerSession();
    const headersList = headers();
    const ipAddress = headersList.get('x-forwarded-for') || 'unknown';
    const userId = validateUserId(params.id);

    if (!userId) {
      return NextResponse.json(
        { error: 'ID de usuario inválido' },
        { status: 400 }
      );
    }

    // Rate limiting
    if (!apiLimiter.check(`put_${ipAddress}`)) {
      await logSecurityEvent(session, 'api_rate_limit_exceeded', { endpoint: `/api/users/${params.id}`, method: 'PUT' }, 'warning');
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Verificar autenticación
    if (!session?.user) {
      await logSecurityEvent(null, 'unauthorized_api_access', { endpoint: `/api/users/${params.id}`, method: 'PUT' }, 'warning');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar permisos de admin
    if (session.user.role !== 'admin') {
      await logSecurityEvent(session, 'insufficient_permissions', { endpoint: `/api/users/${params.id}`, method: 'PUT' }, 'warning');
      return NextResponse.json(
        { error: 'Permisos insuficientes' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updates = {};

    // Validar y sanitizar campos de actualización
    if (body.email !== undefined) {
      const emailValidation = SecurityUtils.validateAndSanitizeInput(body.email, 'email');
      if (!emailValidation.valid) {
        await logSecurityEvent(session, 'user_update_failed', { userId, reason: 'invalid_email' }, 'warning');
        return NextResponse.json(
          { error: emailValidation.error },
          { status: 400 }
        );
      }
      if (emailValidation.value) updates.email = emailValidation.value;
    }

    if (body.role !== undefined) {
      const roleValidation = SecurityUtils.validateAndSanitizeInput(body.role, 'role');
      if (!roleValidation.valid) {
        await logSecurityEvent(session, 'user_update_failed', { userId, reason: 'invalid_role' }, 'warning');
        return NextResponse.json(
          { error: roleValidation.error },
          { status: 400 }
        );
      }
      updates.role = roleValidation.value;
    }

    if (body.status !== undefined) {
      const validStatuses = ['active', 'inactive', 'suspended'];
      if (!validStatuses.includes(body.status)) {
        await logSecurityEvent(session, 'user_update_failed', { userId, reason: 'invalid_status' }, 'warning');
        return NextResponse.json(
          { error: 'Estado inválido' },
          { status: 400 }
        );
      }
      updates.status = body.status;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No hay campos válidos para actualizar' },
        { status: 400 }
      );
    }

    // Actualizar usuario
    const success = UserQueries.updateUser(userId, updates);
    
    if (!success) {
      await logSecurityEvent(session, 'user_update_failed', { userId, reason: 'user_not_found' }, 'warning');
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    await logSecurityEvent(session, 'user_updated', { 
      userId, 
      updatedFields: Object.keys(updates),
      updates: Object.fromEntries(
        Object.entries(updates).filter(([key]) => key !== 'password') // No loguear passwords
      )
    }, 'info');

    return NextResponse.json({
      success: true,
      message: 'Usuario actualizado correctamente'
    });

  } catch (error) {
    console.error('Error updating user:', error);
    
    await logSecurityEvent(session, 'user_update_failed', { 
      userId: params.id,
      error: error.message 
    }, 'error');

    if (error.message.includes('último administrador')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  let session;
  try {
    session = await getServerSession();
    const headersList = headers();
    const ipAddress = headersList.get('x-forwarded-for') || 'unknown';
    const userId = validateUserId(params.id);

    if (!userId) {
      return NextResponse.json(
        { error: 'ID de usuario inválido' },
        { status: 400 }
      );
    }

    // Rate limiting más estricto para DELETE
    if (!apiLimiter.check(`delete_${ipAddress}`)) {
      await logSecurityEvent(session, 'api_rate_limit_exceeded', { endpoint: `/api/users/${params.id}`, method: 'DELETE' }, 'warning');
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Verificar autenticación
    if (!session?.user) {
      await logSecurityEvent(null, 'unauthorized_api_access', { endpoint: `/api/users/${params.id}`, method: 'DELETE' }, 'warning');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar permisos de admin
    if (session.user.role !== 'admin') {
      await logSecurityEvent(session, 'insufficient_permissions', { endpoint: `/api/users/${params.id}`, method: 'DELETE' }, 'warning');
      return NextResponse.json(
        { error: 'Permisos insuficientes' },
        { status: 403 }
      );
    }

    // Prevenir auto-eliminación
    if (parseInt(session.user.id) === userId) {
      await logSecurityEvent(session, 'user_deletion_blocked', { userId, reason: 'self_deletion_attempt' }, 'warning');
      return NextResponse.json(
        { error: 'No puedes eliminar tu propia cuenta' },
        { status: 400 }
      );
    }

    // Eliminar usuario
    const success = UserQueries.deleteUser(userId);
    
    if (!success) {
      await logSecurityEvent(session, 'user_deletion_failed', { userId, reason: 'user_not_found' }, 'warning');
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    await logSecurityEvent(session, 'user_deleted', { 
      deletedUserId: userId
    }, 'info');

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado correctamente'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    
    await logSecurityEvent(session, 'user_deletion_failed', { 
      userId: params.id,
      error: error.message 
    }, 'error');

    if (error.message.includes('último administrador')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
