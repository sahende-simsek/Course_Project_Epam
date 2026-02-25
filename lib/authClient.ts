const AuthClient = {
  async login(email: string, password: string) {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      let body: any;
      try { body = await res.json(); } catch { body = await res.text(); }
      const msg = body && (body.error || body.message) ? (body.error || body.message) : JSON.stringify(body);
      throw new Error(msg || `Login failed (${res.status})`);
    }
    return res.json();
  },
  async register(email: string, password: string) {
    const res = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      let body: any;
      try { body = await res.json(); } catch { body = await res.text(); }
      const msg = body && (body.error || body.message) ? (body.error || body.message) : JSON.stringify(body);
      throw new Error(msg || `Register failed (${res.status})`);
    }
    return res.json();
  },
};

export default AuthClient;
