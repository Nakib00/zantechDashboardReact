import React from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import './Landing.css';
import usePageTitle from '../../hooks/usePageTitle';

import AmbassadorApplication from './AmbassadorApplication';
import OurAmbassadors from './OurAmbassadors';
import Projects from './Projects';
import CompanyInfo from './CompanyInfo';

const LandingPage = () => {
    usePageTitle('Landing Page');
    return (
        <div className="landing-container">
            <Tabs defaultActiveKey="application" id="landing-page-tabs" className="mb-3" fill>
                <Tab eventKey="application" title="Ambassador Application">
                    <AmbassadorApplication />
                </Tab>
                <Tab eventKey="ambassadors" title="Our Ambassadors">
                    <OurAmbassadors />
                </Tab>
                <Tab eventKey="projects" title="Projects">
                    <Projects />
                </Tab>
                <Tab eventKey="company-info" title="Company Info">
                    <CompanyInfo />
                </Tab>
            </Tabs>
        </div>
    );
};

export default LandingPage;