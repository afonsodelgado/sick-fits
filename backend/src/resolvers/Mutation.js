const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { randomBytes } = require('crypto')
const { promisify } = require('util')
const { makeEmail, transport } = require('../mail')
const { hasPermission } = require('../utils')

const Mutations = {
  // ITEMS MUTATIONS
  async createItem(parent, args, ctx, info) {
    if (!ctx.request.userId) throw new Error('You must be logged in to create a item')
    const item = await ctx.db.mutation.createItem({ data: { ... args, user: { connect: {
      id: ctx.request.userId
    } } } }, info);
    return item;
  },
  updateItem(parent, args, ctx, info) {
    const updates = { ...args }
    delete updates.id

    return ctx.db.mutation.updateItem({
      data: updates,
      where: {
        id: args.id
      }
    }, info)
  },
  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id }
    const item = await ctx.db.query.item({ where }, `{ id title user { id } }`)

    const ownsItem = item.user.id === ctx.request.userId;
    const hasPermissions = ctx.request.user.permissions.some(permission =>
      ['ADMIN', 'ITEMDELETE'].includes(permission)
    )

    if (!ownsItem && !hasPermissions) {
      throw new Error('You do not have permission to do that!')
    }

    return ctx.db.mutation.deleteItem({ where }, info)
  },

  // USER MUTATIONS
  async signup(parent, args, ctx, info) {
    args.email = args.email.toLowerCase()
    // hash password
    const password = await bcrypt.hash(args.password, 10)
    // create user in the db
    const user = await ctx.db.mutation.createUser({
      data: { ... args, password, permissions: { set: ['USER'] } }
    }, info);
    // generate a jwt for the user
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET)
    // Set the jwt as a cookie on the response
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    })
    //return the user to the browser
    return user
  },
  async signin(parent, { email, password }, ctx, info) {
    const user = await ctx.db.query.user({ where: { email } })
    if (!user) throw new Error(`No such user found`);

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) throw new Error('Invalid password')

    //Set the cookie for the logged user
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET)
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    })

    return user
  },
  signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token')
    return { message: 'Logged out' }
  },
  async requestReset(parent, args, ctx, info) {
    // is this a real user?
    const user = await ctx.db.query.user({ where: { email: args.email } })
    if (!user) throw new Error(`No such user found`);
    // set reset token and expiry on the user
    const token = await promisify(randomBytes)(20)
    const resetToken = token.toString('hex')
    const resetTokenExpiry = Date.now() + 3600000 // 1 hour
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry }
    })

    const mailRes = await transport.sendMail({
      from: 'afonsodelgadoss@gmail.com',
      to: user.email,
      subject: 'Password Reset',
      html: makeEmail(`xHere is your reset token
      \n\n
      <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">Click here to reset!</a>`)
    })

    return { message: 'Reset successful' }
  },
  async resetPassword(parent, args, ctx, info) {
    // check if the passwords match
    if (args.password !== args.confirmPassword) throw new Error('The passwords do not match')
    // check if is a legit resetToken
    // check if it is exprired
    const [ user ] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000
      }
    })

    if (!user) throw new Error('This token is either invalid or expired')
    // hash new password
    const password = await bcrypt.hash(args.password, 10)
    // save new password and remove reset token fields
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: { password, resetToken: null, resetTokenExpiry: null }
    })
    // generate jwt
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET)
    // set cookie
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    })
    // return new user
    return updatedUser
  },
  async updatePermissions(parent, args, ctx, info) {
    if (!ctx.request.userId) throw new Error('You must be logged in')
    
    const user = await ctx.db.query.user({ where: { id: ctx.request.userId } }, info)
    hasPermission(user, ['ADMIN', 'PERMISSIONUPDATE'])

    return ctx.db.mutation.updateUser({
      data: { permissions: { set: args.permissions } },
      where: { id: args.userId }
    }, info)
  },
  async addToCart(parent, args, ctx, info) {
    const { userId } = ctx.request
    if (!userId) throw new Error ('You must be signed in')

    const [ existingCartItem ] = await ctx.db.query.cartItems({
      where: {
        user: { id: userId },
        item: { id: args.id }
      }
    })

    if (existingCartItem) return ctx.db.mutation.updateCartItem({
      where: { id: existingCartItem.id },
      data: { quantity: existingCartItem.quantity + 1 }
    }, info)

    return ctx.db.mutation.createCartItem({
      data: {
        user: { connect: { id: userId } },
        item: { connect: { id: args.id } }
      }
    }, info)
  },
  async removeFromCart(parent, args, ctx, info) {
    const cartItem = await ctx.db.query.cartItem({
      where: {
        id: args.id
      }
    }, `{ id user { id } }`)

    if (!cartItem) throw new Error('No item found')
    if (cartItem.user.id !== ctx.request.userId) throw new Error('This item is not yours')

    return ctx.db.mutation.deleteCartItem({
      where: { id: args.id }
    }, info)
  }
};

module.exports = Mutations;
