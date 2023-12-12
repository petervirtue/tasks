import { DATA_SOURCE } from 'src/constants';
import { User } from 'src/users/entities/user.entity';
import { DataSource } from 'typeorm';

console.log(__dirname + '/../**/entities/*.entity.ts');

export const databaseProviders = [
  {
    provide: DATA_SOURCE,
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: 5432,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        entities: [User],
        synchronize: true,
      });

      return dataSource.initialize();
    },
  },
];
