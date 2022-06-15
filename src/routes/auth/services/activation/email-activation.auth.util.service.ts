import { Transporter } from 'nodemailer';

export class EmailActivationAuthUtilService {
	constructor(
		private readonly deps: {
			readonly transporter: Transporter;
		},
		private readonly opts: {
			readonly ACTIVATION_PATH: string;
		},
	) {}

	sendActivationMail(email: string, activationCode: string) {
		// not await this operation, because its took so long
		// and we not required response from it
		this.deps.transporter.sendMail({
			to: email,
			subject: 'Account activation',
			html: this.getActivationMail(activationCode),
		});
	}

	private getActivationMail(activationCode: string) {
		return `<a href="${this.opts.ACTIVATION_PATH}?code=${activationCode}">Activate account</a>`;
	}
}
