import jsdom from './jsdomRegister';
import {assert} from 'chai';


describe('Naja.js', function () {
	jsdom();

	beforeEach(function (done) {
		this.Naja = require('../src/Naja').default;
		done();
	});

	it('should initialize once', function () {
		const naja = new this.Naja();
		let thrown = false;
		assert.isFalse(naja.initialized);

		naja.initialize();
		assert.isTrue(naja.initialized);

		try {
			naja.initialize();

		} catch (e) {
			assert.instanceOf(e, Error);
			assert.equal(e.message, "Cannot initialize Naja, it is already initialized.");
			thrown = true;
		}

		assert.isTrue(thrown);
	});

	describe('event system', function () {
		it('should call event listener', function () {
			const naja = new this.Naja();
			let initCalled = false;

			naja.addEventListener('init', evt => initCalled = true);
			naja.initialize();

			assert.isTrue(initCalled);
		});

		it('should not call listener after evt.stopImmediatePropagation() call', function () {
			const naja = new this.Naja();
			let loadCalled = false;
			let loadCalled2 = false;

			naja.addEventListener('load', evt => { loadCalled = true; evt.stopImmediatePropagation(); });
			naja.addEventListener('load', evt => loadCalled2 = true);
			naja.initialize();

			assert.isTrue(loadCalled);
			assert.isFalse(loadCalled2);
		});

		it('should return false after evt.preventDefault() call', function () {
			const naja = new this.Naja();
			assert.isTrue(naja.fireEvent('foo'));

			naja.addEventListener('foo', evt => evt.preventDefault());
			assert.isFalse(naja.fireEvent('foo'));
		});
	});

	describe('extensions system', function () {
		beforeEach(function (done) {
			this.Naja = require('../src/Naja').default;
			done();
		});

		it('registers extensions', function () {
			const Naja = this.Naja;
			const naja = new Naja();

			let initialized = false;
			const extension = class {
				constructor(naja, foo, bar) {
					initialized = true;
					assert.instanceOf(naja, Naja);
					assert.equal(42, foo);
					assert.equal('42', bar);
				}
			};

			naja.registerExtension(extension, 42, '42');
			assert.equal(1, naja.extensions.length);

			naja.initialize();
			assert.isTrue(initialized);
		});
	});
});
