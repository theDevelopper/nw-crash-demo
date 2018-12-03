<template>
	<div></div>
</template>

<script>
	import { info, warn, silly } from 'lib/logger';
	import { hasDatabaseFile, createDatabase, openDatabase } from 'database';
	import docAggregation from '../middleware/batch/docAggregation.legacy';

	export default {
		name: 'launch',

		async mounted() {
			info('App launched');

			// Stap 1: does database exist
			info('checking if database exists');
			const doesDatabaseExist = await hasDatabaseFile();

			// NO: load install
			if (!doesDatabaseExist) {
				info('database does not exist, creating database now and triggering install process');
				await createDatabase();
			}

			const db = await openDatabase();

			silly('her eis where the drama begins: this call is causing it');
			await docAggregation(db, 100); // src/legacy/index.js line 76

			silly('not getting here at all');
		},
	};
</script>
