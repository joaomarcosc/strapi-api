/*
 *
 * HomePage
 *
 */

import React, { memo } from 'react';
// import PropTypes from 'prop-types';
import pluginId from '../../pluginId';
import { Layout, BaseHeaderLayout, ContentLayout } from '@strapi/design-system';

const HomePage = () => {
  return (
    <Layout>
      <BaseHeaderLayout title="Tarefas" subtitle="Gerencie suas tarefas" />
      <ContentLayout>Happy coding</ContentLayout>
    </Layout>
  );
};

export default memo(HomePage);
