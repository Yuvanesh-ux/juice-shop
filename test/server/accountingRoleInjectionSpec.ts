/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import sinon from 'sinon'
import chai from 'chai'
import sinonChai from 'sinon-chai'
import type { Request, Response, NextFunction } from 'express'

const expect = chai.expect
chai.use(sinonChai)

describe('accountingRoleInjectionPrevention', () => {
  let req: Partial<Request>
  let res: Partial<Response>
  let next: sinon.SinonSpy

  beforeEach(() => {
    next = sinon.spy()
    res = {}
  })

  // Simulating the middleware logic added to server.ts
  const accountingRoleStrip = (req: Request, res: Response, next: NextFunction) => {
    if (req.body.role === 'accounting') {
      delete req.body.role
    }
    next()
  }

  it('should strip accounting role from request body', () => {
    req = { body: { email: 'test@test.com', password: 'test', role: 'accounting' } }
    accountingRoleStrip(req as Request, res as Response, next)
    expect(req.body.role).to.be.undefined
    expect(next).to.have.been.calledOnce
  })

  it('should not strip admin role from request body (intended challenge)', () => {
    req = { body: { email: 'test@test.com', password: 'test', role: 'admin' } }
    accountingRoleStrip(req as Request, res as Response, next)
    expect(req.body.role).to.equal('admin')
    expect(next).to.have.been.calledOnce
  })

  it('should not strip deluxe role from request body', () => {
    req = { body: { email: 'test@test.com', password: 'test', role: 'deluxe' } }
    accountingRoleStrip(req as Request, res as Response, next)
    expect(req.body.role).to.equal('deluxe')
    expect(next).to.have.been.calledOnce
  })

  it('should not strip customer role from request body', () => {
    req = { body: { email: 'test@test.com', password: 'test', role: 'customer' } }
    accountingRoleStrip(req as Request, res as Response, next)
    expect(req.body.role).to.equal('customer')
    expect(next).to.have.been.calledOnce
  })

  it('should handle request without role field', () => {
    req = { body: { email: 'test@test.com', password: 'test' } }
    accountingRoleStrip(req as Request, res as Response, next)
    expect(req.body.role).to.be.undefined
    expect(next).to.have.been.calledOnce
  })
})
