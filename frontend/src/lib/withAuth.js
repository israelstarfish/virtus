'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function withAuth(Component) {
	return function ProtectedComponent(props) {
		const router = useRouter();
		const [authorized, setAuthorized] = useState(false);

		useEffect(() => {
			const token = document.cookie
				.split('; ')
				.find(row => row.startsWith('token='))
				?.split('=')[1];

			if (!token) {
				router.push('/signin');
			} else {
				setAuthorized(true);
			}
		}, [router]);

		if (!authorized) return null;
		return <Component {...props} />;
	};
}