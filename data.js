import faker from 'faker';
import _ from 'lodash';

export const timeSheets = () => {
  return _.times(100, function(n) {
    return {
      id: n,
      user_id: faker.internet.email(),
      date: faker.date.recent(),
      project: faker.random.arrayElement(['StoreZero', 'Auth0 Dashboard']),
      hours: faker.datatype.number({min:4, max:8}),
      approved: false
    }
  })
}
