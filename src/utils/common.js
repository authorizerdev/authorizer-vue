import { hasWindow } from './window';

export const getIntervalDiff = (accessTokenExpiresAt) => {
	const expiresAt = accessTokenExpiresAt * 1000 - 300000;
	const currentDate = new Date();

	const millisecond = new Date(expiresAt).getTime() - currentDate.getTime();
	return millisecond;
};

export const getCrypto = () => {
	//ie 11.x uses msCrypto
	return hasWindow() ? window.crypto || window.msCrypto : null;
};

export const createRandomString = () => {
	const charset =
		'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_~.';
	let random = '';
	const crypto = getCrypto();
	if (crypto) {
		const randomValues = Array.from(crypto.getRandomValues(new Uint8Array(43)));
		randomValues.forEach((v) => (random += charset[v % charset.length]));
	}
	return random;
};

export const createQueryParams = (params) => {
	return Object.keys(params)
		.filter((k) => typeof params[k] !== 'undefined')
		.map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
		.join('&');
};

export const isValidEmail = (email) => {
	return String(email)
		.toLowerCase()
		.match(
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		);
};

export const capitalizeFirstLetter = (data) => {
	return data ? data.charAt(0).toUpperCase() + data.slice(1) : null;
};

export const isValidOtp = (otp) => {
	const re = /^([A-Z0-9]{6})$/;
	return otp && re.test(String(otp.trim()));
};
