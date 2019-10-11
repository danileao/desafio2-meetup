import * as Yup from 'yup';
import jwt from 'jsonwebtoken';
import User from '../models/User';

import authConfig from '../../config/auth';

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(7),
    });

    try {
      await schema.validate(req.body, { abortEarly: false });
    } catch (err) {
      const errors = [];
      err.errors.map(e => errors.push(e));
      return res.status(404).json(errors);
    }

    const { email } = req.body;

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(404).json({ error: 'User already exists' });
    }

    try {
      const user = await User.create(req.body);
      return res.json({
        user,
        token: jwt.sign({ id: user.id }, authConfig.secret, {
          expiresIn: authConfig.expiresIn,
        }),
      });
    } catch (err) {
      return res.json({ error: err });
    }
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(7),
      password: Yup.string()
        .min(7)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string()
        .min(7)
        .when('password', (password, field) =>
          password
            ? field
                .required()
                .oneOf([Yup.ref('password')], 'Password does not match')
            : field
        ),
    });

    try {
      await schema.validate(req.body);
    } catch (err) {
      const errors = [];
      err.errors.map(e => errors.push(e));
      return res.status(404).json(errors);
    }

    const { oldPassword, email } = req.body;

    const user = await User.findByPk(req.userId);
    if (user.email !== email) {
      const userExistWithEmail = await User.findOne({ where: { email } });

      if (userExistWithEmail) {
        return res.status(404).json({ error: 'User already exists!' });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    const { id, name, provider } = await user.update(req.body);

    return res.json({
      id,
      name,
      provider,
      email,
    });
  }
}

export default new UserController();
