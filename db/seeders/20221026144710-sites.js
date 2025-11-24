'use strict';

const { faker } = require('@faker-js/faker');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
     let sites = Array(25).fill(0).map( (v,idx) => ({
      // id: idx,
      name: faker.company.name(),
      url: faker.internet.url(),
      user: faker.internet.userName(),
      password: faker.internet.password(),
      description: faker.lorem.paragraphs(5),
      categoryId: faker.datatype.number({ min: 0, max: 10 }),
      createdAt: new Date(),
      updatedAt: new Date()
     }))
     await queryInterface.bulkInsert('Sites', sites)
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
