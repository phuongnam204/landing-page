import { NextRequest, NextResponse } from 'next/server';
import { BRANCH_CODES } from '../../../content/branches';

const PHONE_RE = /^(0[0-9]{9}|\+84[0-9]{9})$/;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'invalid body' }, { status: 400 });

  const { name, phone, branch, skinCondition, programId, recipeId } = body;

  if (!name?.trim() || name.trim().length > 100)
    return NextResponse.json({ error: 'Tên không hợp lệ' }, { status: 400 });
  if (!PHONE_RE.test(phone?.trim() ?? ''))
    return NextResponse.json({ error: 'Số điện thoại không hợp lệ' }, { status: 400 });
  if (!BRANCH_CODES.includes(branch))
    return NextResponse.json({ error: 'Chi nhánh không hợp lệ' }, { status: 400 });

  const webhookUrl = process.env.LEAD_WEBHOOK_URL;
  if (!webhookUrl)
    return NextResponse.json({ error: 'webhook not configured' }, { status: 503 });

  const payload = {
    timestamp: new Date().toISOString(),
    name: name.trim(),
    phone: phone.trim(),
    skinCondition: skinCondition ?? '',
    branch,
    programId: programId ?? '',
    recipeId: recipeId ?? '',
  };

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`upstream ${res.status}`);
  } catch {
    return NextResponse.json({ error: 'Không thể gửi thông tin, thử lại sau.' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
