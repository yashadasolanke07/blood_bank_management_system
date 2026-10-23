import { useState } from 'react';
import { Droplet } from 'lucide-react';
import TextField from '../components/common/TextField.jsx';
export default function Login({ onLogin }) {
    const [email, setEmail] = useState('admin@hemocare.example');
    const [password, setPassword] = useState('');
    return <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-950 via-red-800 to-rose-600 p-4">
            <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2">
            <div className="hidden flex-col justify-between bg-red-950 p-10 text-white md:flex">
            <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-700 p-3">
            <Droplet size={25}/>
            </div>
            <span className="text-xl font-bold">HemoCare</span>
            </div>
            <div>
            <p className="mb-3 text-sm font-semibold tracking-widest text-red-300">BLOOD BANK MANAGEMENT</p>
            <h1 className="text-4xl font-bold leading-tight">Every donation can make a difference.</h1>
            <p className="mt-4 leading-7 text-red-100/80">Manage donors, inventory and blood requests from one workspace.</p>
            </div>
            <p className="text-xs text-red-200/70">Frontend demo · Sample data only</p>
            </div>
            <div className="p-7 sm:p-10">
            <div className="mb-8 flex items-center gap-3 md:hidden">
            <div className="rounded-xl bg-red-50 p-3 text-red-700">
            <Droplet size={22}/>
            </div>
            <span className="text-xl font-bold">HemoCare</span>
            </div>
            <p className="text-sm font-bold tracking-widest text-red-700">WELCOME BACK</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Admin sign in</h2>
            <p className="mt-2 text-sm text-slate-500">This is a demo sign-in screen, not real authentication.</p>
            <form className="mt-8 space-y-5" onSubmit={e => { e.preventDefault(); onLogin(); }}>
            <TextField label="Email address" value={email} onChange={setEmail} type="email" required/>
            <TextField label="Password" value={password} onChange={setPassword} type="password" required placeholder="Enter any demo password"/>
            <button className="btn-primary w-full py-3">Sign in to demo</button>
            </form>
            <p className="mt-5 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800">Demo only: any non-empty password works. Do not use this login for real accounts until server-side authentication is implemented.</p>
            </div>
            </div>
            </div>;
}

