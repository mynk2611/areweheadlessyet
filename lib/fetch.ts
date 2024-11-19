import humps from 'humps';
import type { Topic } from '../components/StreamField/blocks/TopicsBlock';
import { AreWeHeadlessYetTopicPage } from '../components/types';

/**
 * Helper to fetch data from Wagtail's API.
 * @param path - URl path.
 * @param params - Mapping of query parameters.
 */
async function fetchHelper(path: string, params: { [key: string]: string }) {
    let headers = new Headers();
    if (process.env.INSTANCE === 'staging') {
        const auth =
            'Basic ' +
            Buffer.from(
                `${process.env.AUTH_USER}:${process.env.AUTH_PASSWORD}`,
            ).toString('base64');
        headers.append('Authorization', auth);
    }
    const response = await fetch(
        `${process.env.BASE_URL}api/v2/pages/${path}?` +
        new URLSearchParams(params),
        { headers: headers },
    );

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    return await response.json();
}

/**
 * Retrieves the ID of the AreWeHeadless home page for further API querying.
 */
async function getAreWeHeadlessYetHomePageID() {
    const response = await fetchHelper('', {
        type: 'areweheadlessyet.AreWeHeadlessYetHomePage',
    });

    const items = response.items;
    if (items.length === 0) {
        throw new Error("Failed to fetch AreWeHeadlessYet home page's ID.");
    }
    return items[0].id;
}

/**
 * Retrieves the AreWeHeadlessYet home page.
 */
export async function getAreWeHeadlessYetHomePage() {
    const homePageID = await getAreWeHeadlessYetHomePageID();
    const response = await fetchHelper(homePageID, {});
    return humps.camelizeKeys(response);
}

/**
 * Retrieves all topics defined in the AreWeHeadlessYet backend.
 */
export async function getAreWeHeadlessYetTopics() {
    const response = await fetchHelper('', {
        type: 'areweheadlessyet.AreWeHeadlessYetTopicPage',
        fields: 'title,status_color,introduction',
    });
    return humps.camelizeKeys(response);
}

/**
 * Retrieves all topic pages from the AreWeHeadlessYet backend.
 */
export async function getAreWeHeadlessYetTopicPages() {
    const response = await fetchHelper('', {
        type: 'areweheadlessyet.AreWeHeadlessYetTopicPage',
        fields: '*',
    });
    return humps.camelizeKeys(response.items) as Topic[];
}

/**
 * Retrieves a topic's page.
 * @param slug - Topic's slug
 */
export async function getAreWeHeadlessYetTopicPage(slug: string) {
    const response = await fetchHelper('', {
        type: 'areweheadlessyet.AreWeHeadlessYetTopicPage',
        slug: slug,
        fields: '*',
    });

    const items = response.items;
    if (items.length === 0) {
        throw new Error(`Failed to fetch the ${slug} topic page.`);
    }
    return humps.camelizeKeys(items[0]) as AreWeHeadlessYetTopicPage;
}
