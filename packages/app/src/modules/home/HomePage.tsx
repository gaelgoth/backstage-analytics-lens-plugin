import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Flex,
  Text,
  HeaderPage,
} from '@backstage/ui';
import { useAnalytics } from '@backstage/core-plugin-api';
import { RiAddLine } from '@remixicon/react';

export const HomePage = () => {
  const analytics = useAnalytics();

  const [count, setCount] = useState(0);

  const handleIncrement = () => {
    setCount(prev => {
      const next = prev + 1;

      analytics.captureEvent('increment', 'playground counter', {
        value: next,
        attributes: {
          source: 'dev-app',
        },
      });

      return next;
    });
  };

  return (
    <>
      <HeaderPage title="Analytics Lens playground" />
      <Container>
        <Flex py={{ xs: 'sm', md: 'md' }}>
          <Box width="fit-content" maxWidth="100%">
            <Card>
              <CardHeader>Counter</CardHeader>
              <CardBody>
                <Flex direction="row" align="center">
                  <Button iconStart={<RiAddLine />} onClick={handleIncrement}>
                    Increment
                  </Button>
                  <Box ml={{ xs: 'sm', md: 'md' }}>
                    <Text>Count: {count}</Text>
                  </Box>
                </Flex>
              </CardBody>
            </Card>
          </Box>
        </Flex>
      </Container>
    </>
  );
};
