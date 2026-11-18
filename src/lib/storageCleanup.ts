/**
 * Utility to clean legacy dummy data from localStorage so the user starts completely fresh.
 */
export function purgeDummyDataIfPresent() {
  try {
    const CLEANUP_FLAG = 'splitwise_v2_dummy_purged';
    if (!localStorage.getItem(CLEANUP_FLAG)) {
      const groups = localStorage.getItem('splitwise_groups');
      const user = localStorage.getItem('splitwise_user_profile');

      // Check if dummy data is present
      if (
        (groups && (groups.includes('grp_goa') || groups.includes('grp_flat') || groups.includes('grp_dinner'))) ||
        (user && user.includes('usr_alex'))
      ) {
        localStorage.removeItem('splitwise_groups');
        localStorage.removeItem('splitwise_expenses');
        localStorage.removeItem('splitwise_settlements');
        localStorage.removeItem('splitwise_contacts');
        localStorage.removeItem('splitwise_user_profile');
      }

      localStorage.setItem(CLEANUP_FLAG, 'true');
    }
  } catch (e) {
    console.error('Failed to cleanup dummy data', e);
  }
}

/**
 * Manually wipes all local state and localStorage.
 */
export function wipeAllLocalData() {
  try {
    localStorage.removeItem('splitwise_groups');
    localStorage.removeItem('splitwise_expenses');
    localStorage.removeItem('splitwise_settlements');
    localStorage.removeItem('splitwise_contacts');
    localStorage.removeItem('splitwise_user_profile');
    localStorage.setItem('splitwise_v2_dummy_purged', 'true');
  } catch (e) {
    console.error('Failed to wipe all data', e);
  }
}
