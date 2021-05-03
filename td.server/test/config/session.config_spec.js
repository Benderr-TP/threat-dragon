import AzureTablesStoreFactory from 'connect-azuretables';
import { expect } from 'chai';
import sinon from 'sinon';

import env from '../../src/env/Env.js';
import loggers from '../../src/config/loggers.config.js';
import sessionConfig from '../../src/config/session.config.js';

describe('session config tests', () => {
    const mockApp = {
        use: () => {}
    };
    const sessionSigningKey = 'somekey';

    beforeEach(() => {
        sinon.spy(mockApp, 'use');
        sinon.spy(loggers.logger, 'error');
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('dev environment', () => {
        const mockEnv = {
            config: {
                SESSION_SIGNING_KEY: sessionSigningKey,
                SESSION_STORE: 'local'
            }
        };
        beforeEach(() => {
            sinon.stub(env, 'get').returns(mockEnv);
            sessionConfig.config(mockApp);
        });

        it('logs an error about insecure cookies', () => {
            expect(loggers.logger.error).to.have.been.calledWith(
                { security: true },
                sinon.match('cookie')
            );
        });

        it('logs an error about local session storage', () => {
            expect(loggers.logger.error).to.have.been.calledWith(
                { security: true },
                sinon.match('local session store used')
            );
        });

        it('tells the app to use the express session', () => {
            expect(mockApp.use).to.have.been.calledOnce;
        });
    });

    describe('prod environment', () => {
        const mockEnv = {
            config: {
                SESSION_SIGNING_KEY: sessionSigningKey,
                SESSION_STORE: 'azure',
                NODE_ENV: 'simulated_production'
            }
        };
        beforeEach(() => {
            sinon.stub(env, 'get').returns(mockEnv);
            sinon.spy(AzureTablesStoreFactory);
        });

        afterEach(() => {
            process.env.NODE_ENV = 'development';
        });

        it('sets the secure cookie option', () => {
            expect(loggers.logger.error).not.to.have.been.called;
        });

        it('sets the session store to azure table storage', () => {
            expect(loggers.logger.error).not.to.have.been.called;
        });
    });
});

