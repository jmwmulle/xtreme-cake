<?php
App::uses('AppController', 'Controller');
/**
 * Users Controller
 *
 * @property User $User
 * @property PaginatorComponent $Paginator
 */
class UsersController extends AppController {

/**
 * Components
 *
 * @var array
 */
	public $components = array('Paginator');

/**
 * index method
 *
 * @return void
 */
	public function index() {
		$this->User->recursive = 0;
		$this->set('users', $this->Paginator->paginate());
	}

/**
 * view method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function view($id = null) {
		if (!$this->User->exists($id)) {
			throw new NotFoundException(__('Invalid user'));
		}
		$options = array('conditions' => array('User.' . $this->User->primaryKey => $id));
		$this->set('user', $this->User->find('first', $options));
	}

/**
 * add method
 *
 * @return void
 */
	public function add() {
		if ($this->request->is('post')) {
			$this->User->create();
			if ($this->User->save($this->request->data)) {
				$this->Session->setFlash(__('The user has been saved.'));
				return $this->redirect(array('action' => 'index'));
			} else {
				$this->Session->setFlash(__('The user could not be saved. Please, try again.'));
			}
		}
		$groups = $this->User->Group->find('list');
		$this->set(compact('groups'));
	}

/**
 * edit method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function edit($id = null) {
		if (!$this->User->exists($id)) {
			throw new NotFoundException(__('Invalid user'));
		}
		if ($this->request->is(array('post', 'put'))) {
			if ($this->User->save($this->request->data)) {
				$this->Session->setFlash(__('The user has been saved.'));
				return $this->redirect(array('action' => 'index'));
			} else {
				$this->Session->setFlash(__('The user could not be saved. Please, try again.'));
			}
		} else {
			$options = array('conditions' => array('User.' . $this->User->primaryKey => $id));
			$this->request->data = $this->User->find('first', $options);
		}
		$groups = $this->User->Group->find('list');
		$this->set(compact('groups'));
	}

/**
 * delete method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function delete($id = null) {
		$this->User->id = $id;
		if (!$this->User->exists()) {
			throw new NotFoundException(__('Invalid user'));
		}
		$this->request->allowMethod('post', 'delete');
		if ($this->User->delete()) {
			$this->Session->setFlash(__('The user has been deleted.'));
		} else {
			$this->Session->setFlash(__('The user could not be deleted. Please, try again.'));
		}
		return $this->redirect(array('action' => 'index'));
	}

#register	
	public function register() {
		// don't know enough about oAuth to know if this is 1 function or 4 (FB/Twitter/G+/e-mail)
	}

#login	
	public function login() {
	    if ($this->Session->read('Auth.User')) {
		$this->Session->setFlash('You are logged in!');
		return $this->redirect('/');
	    }
	    if ($this->request->is('post')) {
		if ($this->Auth->login()) {
		    return $this->redirect($this->Auth->redirect());
		}
		$this->Session->setFlash(__('Your username or password was incorrect.'));
	    }
	}

#logout	
	public function logout() {
		$this->Session->setFlash('Good-Bye');
		$this->redirect($this->Auth->logout());$this->Session->setFlash('Good-Bye');
		$this->redirect($this->Auth->logout());
	}

#opauth_complete	
	public function opauth_complete() {
		db($this->data);
		$conditions = array('User.email' => $this->data['auth']['info']['email']);
		if ($this->User->hasAny($conditions)){
			if ($this->Auth->login(array('email' => $this->data['auth']['info']['email'], 'password' => $this->data['auth']['uid']))) {
				return $this->redirect($this->Auth->redirect());
			} else {
				db("Login Failed");
			}
		} else {
			$newUser = array('User' => array(
				'email' => $this->data['auth']['info']['email'],
				'password' => $this->data['auth']['uid'],
				'firstname' => $this->data['auth']['info']['first_name'],
				'lastname' => $this->data['auth']['info']['last_name'],
				'group_id' => 1
			));
			if ($this->User->save($newUser)) {
			} else {
				db("Failed to Create User");
			}
			$this->Session->setFlash(__('Logged in. Welcome ' + $this->data['auth']['info']['name'] + '.'));
			return $this->redirect($this->Auth->redirect());
		}
	}

#home	
	public function home() {
		$this->redirect(___cakeUrl('pages','splash'));
	}

#beforeFilter	
	public function beforeFilter() {
	    parent::beforeFilter();

	    // For CakePHP 2.1 and up
	    $this->Auth->allow();
	}
}
